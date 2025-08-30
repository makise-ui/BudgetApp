package com.example.mobileminer;

import androidx.appcompat.app.AppCompatActivity;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.BatteryManager;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.UUID;

public class MainActivity extends AppCompatActivity {

    private static final String TAG = "MobileMiner";
    private TextView logTextView;
    private TextView batteryStatusTextView;
    private TextView tempStatusTextView;
    private Button startStopButton;
    private boolean isMining = false;
    private Process minerProcess;
    private Handler handler = new Handler(Looper.getMainLooper());

    private BroadcastReceiver batteryReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            int level = intent.getIntExtra(BatteryManager.EXTRA_LEVEL, -1);
            int scale = intent.getIntExtra(BatteryManager.EXTRA_SCALE, -1);
            float batteryPct = level * 100 / (float)scale;
            batteryStatusTextView.setText(String.format("Battery: %.0f%%", batteryPct));

            int temp = intent.getIntExtra(BatteryManager.EXTRA_TEMPERATURE, 0) / 10;
            tempStatusTextView.setText(String.format("Temp: %d°C", temp));

            if (isMining && (batteryPct < 20 || temp > 40)) {
                stopMining();
                logTextView.append("\nAuto-paused: Battery low or temperature high.\n");
                // Optionally show a notification
            }
        }
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        logTextView = findViewById(R.id.logTextView);
        batteryStatusTextView = findViewById(R.id.batteryStatusTextView);
        tempStatusTextView = findViewById(R.id.tempStatusTextView);
        startStopButton = findViewById(R.id.startStopButton);

        registerReceiver(batteryReceiver, new IntentFilter(Intent.ACTION_BATTERY_CHANGED));

        startStopButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (isMining) {
                    stopMining();
                } else {
                    startMining();
                }
            }
        });

        // Copy ccminer binary on first launch
        copyCcminerBinary();
    }

    private void copyCcminerBinary() {
        File minerFile = new File(getFilesDir(), "ccminer");
        if (!minerFile.exists()) {
            try {
                InputStream is = getAssets().open("ccminer");
                FileOutputStream fos = new FileOutputStream(minerFile);
                byte[] buffer = new byte[1024];
                int read;
                while ((read = is.read(buffer)) != -1) {
                    fos.write(buffer, 0, read);
                }
                is.close();
                fos.flush();
                fos.close();

                minerFile.setExecutable(true);
                Log.d(TAG, "ccminer binary copied and set executable.");
                logTextView.append("ccminer binary ready.\n");
            } catch (IOException e) {
                Log.e(TAG, "Failed to copy ccminer binary", e);
                logTextView.append("Error: Failed to copy ccminer binary.\n");
            }
        } else {
            Log.d(TAG, "ccminer binary already exists.");
            logTextView.append("ccminer binary already exists.\n");
        }
    }

    private String getWorkerName() {
        String workerName = getSharedPreferences("miner_prefs", MODE_PRIVATE)
                .getString("worker_name", null);
        if (workerName == null) {
            String model = Build.MODEL.replace(" ", "-");
            String random = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
            workerName = model + "-" + random;
            getSharedPreferences("miner_prefs", MODE_PRIVATE).edit()
                    .putString("worker_name", workerName).apply();
            Log.d(TAG, "Generated new worker name: " + workerName);
        }
        return workerName;
    }

    private void startMining() {
        File minerFile = new File(getFilesDir(), "ccminer");
        if (!minerFile.exists() || !minerFile.canExecute()) {
            logTextView.append("Error: ccminer binary not found or not executable.\n");
            return;
        }

        String workerName = getWorkerName();
        String poolUrl = "stratum+tcp://ap.luckpool.net:3956"; // Example pool
        String walletAddress = "RNjEn7tNTZ6DuYnYrxKMsvYzBgJ11P5hQ4"; // Example wallet

        try {
            ProcessBuilder pb = new ProcessBuilder(
                    minerFile.getAbsolutePath(),
                    "-a", "verus",
                    "-o", poolUrl,
                    "-u", walletAddress + "." + workerName,
                    "-p", "x",
                    "-t", "5" // Example threads
            );
            pb.directory(getFilesDir());
            pb.redirectErrorStream(true);
            minerProcess = pb.start();
            isMining = true;
            startStopButton.setText("Stop Mining");
            logTextView.append("\nStarting miner...\n");

            // Start foreground service
            Intent serviceIntent = new Intent(this, MinerService.class);
            serviceIntent.putExtra("worker_name", workerName);
            startService(serviceIntent);

            // Read output
            new Thread(() -> {
                BufferedReader reader = new BufferedReader(new InputStreamReader(minerProcess.getInputStream()));
                String line;
                try {
                    while ((line = reader.readLine()) != null) {
                        String finalLine = line;
                        handler.post(() -> logTextView.append(finalLine + "\n"));
                    }
                } catch (IOException e) {
                    Log.e(TAG, "Error reading miner output", e);
                } finally {
                    try {
                        reader.close();
                    } catch (IOException e) {
                        Log.e(TAG, "Error closing reader", e);
                    }
                    handler.post(() -> {
                        if (isMining) { // If still mining, it means process exited unexpectedly
                            stopMining();
                            logTextView.append("\nMiner process exited unexpectedly.\n");
                        }
                    });
                }
            }).start();

        } catch (IOException e) {
            Log.e(TAG, "Failed to start miner process", e);
            logTextView.append("Error: Failed to start miner process.\n");
        }
    }

    private void stopMining() {
        if (minerProcess != null) {
            minerProcess.destroy(); // or destroyForcibly()
            minerProcess = null;
        }
        isMining = false;
        startStopButton.setText("Start Mining");
        logTextView.append("\nMiner stopped.\n");

        // Stop foreground service
        Intent serviceIntent = new Intent(this, MinerService.class);
        stopService(serviceIntent);
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        unregisterReceiver(batteryReceiver);
        stopMining(); // Ensure miner is stopped when activity is destroyed
    }
}
