
---

📱 Project Description: Mobile Miner Wrapper App

Goal: Wrap the precompiled ccminer binary inside an Android app. The app should:

Run the binary with user-specified pool/wallet settings.

Display live miner logs/output in the UI.

Auto-pause when temperature > 40°C or battery < 20%.

Assign a default worker name like SAM-A54-8UY654 (device model + random string).

Be minimal and look like a system/utility app (no flashy branding).



---

1. App Structure

Frontend (UI)

A single-page dashboard:

TextView/RecyclerView → live log output.

Start/Stop button.

Status indicators: Hashrate, Accepted shares, Battery %, Temp.



Backend (Core)

Copies ccminer binary from assets/ to app-private storage.

Runs binary using ProcessBuilder.

Streams stdout/stderr → updates UI.

Monitors battery + temperature → auto pause/resume.

Generates worker name at first launch and saves in SharedPreferences.




---

2. Binary Integration

Place ccminer inside app/src/main/assets/.

On first app launch:

Copy it to /data/data/<package_name>/files/ccminer.

Set executable:

File miner = new File(context.getFilesDir(), "ccminer");
miner.setExecutable(true);




---

3. Running the Miner

Use ProcessBuilder:

ProcessBuilder pb = new ProcessBuilder(
    context.getFilesDir() + "/ccminer",
    "-a", "verus",
    "-o", "stratum+tcp://POOL:PORT",
    "-u", walletAddress + "." + workerName,
    "-p", "x"
);
pb.directory(context.getFilesDir());
pb.redirectErrorStream(true);
Process process = pb.start();

Capture output:

BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
new Thread(() -> {
    String line;
    while ((line = reader.readLine()) != null) {
        runOnUiThread(() -> logTextView.append(line + "\n"));
    }
}).start();


---

4. Battery & Temperature Control

Battery status via BatteryManager:

IntentFilter ifilter = new IntentFilter(Intent.ACTION_BATTERY_CHANGED);
Intent batteryStatus = context.registerReceiver(null, ifilter);
int level = batteryStatus.getIntExtra(BatteryManager.EXTRA_LEVEL, -1);
int scale = batteryStatus.getIntExtra(BatteryManager.EXTRA_SCALE, -1);
float batteryPct = level * 100 / (float)scale;

Temperature (not every phone reports CPU temp easily). Options:

Use BatteryManager.EXTRA_TEMPERATURE (gives battery temp, in tenths of °C).

Example:

int temp = batteryStatus.getIntExtra(BatteryManager.EXTRA_TEMPERATURE, 0) / 10;


Auto-pause logic (pseudo):

if (batteryPct < 20 || temp > 40) {
    process.destroy();  // Stop miner
    showNotification("Mining paused: temp/battery condition");
}



---

5. Worker Name Generator

On first launch:

String model = Build.MODEL.replace(" ", "-"); // e.g. SAM-A54
String random = UUID.randomUUID().toString().substring(0,6).toUpperCase();
String workerName = model + "-" + random; // SAM-A54-8UY654
saveToPreferences(workerName);


---

6. UI Flow

Launch screen → shows “Start Mining” button.

On click: copy binary (if not already copied), start process.

Log view → scrolling text of ccminer output.

Status bar (battery %, temp, hash rate).

Auto-stop triggers → message in UI + miner stopped.



---

7. Extra Considerations

Run miner in a Foreground Service → so mining continues if screen is off.

Add notification while mining (so OS doesn’t kill process).

Allow user to edit pool/wallet in Settings screen.

If you want it stealthy: no launcher icon, launchable via system intent.



---

⚡ Worker Line (final exec command)


./ccminer -a verus  -o stratum+tcp://ap.luckpool.net:3956 -u RNjEn7tNTZ6DuYnYrxKMsvYzBgJ11P5hQ4.<model name>-<random number> -p x -t 5

---



