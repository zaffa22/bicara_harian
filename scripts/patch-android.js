// Menambahkan akses Text-to-speech ke AndroidManifest (wajib di Android 11+).
const fs = require("fs");
const file = "android/app/src/main/AndroidManifest.xml";
let xml = fs.readFileSync(file, "utf8");
if (!xml.includes("TTS_SERVICE")) {
  xml = xml.replace("</manifest>",
    '    <queries>\n        <intent>\n            <action android:name="android.intent.action.TTS_SERVICE" />\n        </intent>\n    </queries>\n</manifest>');
  fs.writeFileSync(file, xml);
}
