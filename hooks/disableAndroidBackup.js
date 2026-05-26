#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

module.exports = function (context) {
  const projectRoot = context.opts.projectRoot;

  const manifestPaths = [
    path.join(projectRoot, "platforms", "android", "app", "src", "main", "AndroidManifest.xml"),
    path.join(projectRoot, "platforms", "android", "AndroidManifest.xml")
  ];

  const manifestPath = manifestPaths.find(fs.existsSync);

  if (!manifestPath) {
    console.log("[disable-android-backup] AndroidManifest.xml not found. Skipping.");
    return;
  }

  let manifest = fs.readFileSync(manifestPath, "utf8");

  const applicationTagRegex = /<application\\b([^>]*)>/;

  if (!applicationTagRegex.test(manifest)) {
    console.log("[disable-android-backup] <application> tag not found. Skipping.");
    return;
  }

  manifest = manifest.replace(applicationTagRegex, function (match) {
    let updated = match;

    if (/android:allowBackup="[^"]*"/.test(updated)) {
      updated = updated.replace(
        /android:allowBackup="[^"]*"/,
        'android:allowBackup="false"'
      );
    } else {
      updated = updated.replace(
        "<application",
        '<application android:allowBackup="false"'
      );
    }

    return updated;
  });

  fs.writeFileSync(manifestPath, manifest, "utf8");

  console.log("[disable-android-backup] android:allowBackup=false applied successfully.");
};
