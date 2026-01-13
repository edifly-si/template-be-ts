#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const readCommitMessage = (filePath) => {
  if (!filePath || !fs.existsSync(filePath)) {
    return "Update version";
  }

  const raw = fs.readFileSync(filePath, "utf8");
  const firstLine = raw.split(/\r?\n/).find((line) => line.trim().length > 0);
  return (firstLine || "Update version").trim();
};

const bumpPatch = (version) => {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version || "");
  if (!match) {
    return "0.0.1";
  }

  const major = Number(match[1]);
  const minor = Number(match[2]);
  const patch = Number(match[3]) + 1;
  return `${major}.${minor}.${patch}`;
};

const readVersionHistory = (filePath) => {
  if (!fs.existsSync(filePath)) {
    return [];
  }

  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    return [];
  }
};

const main = () => {
  const msgFile = process.argv[2];
  const description = readCommitMessage(msgFile);
  const filePath = path.resolve(process.cwd(), "version.json");

  const history = readVersionHistory(filePath);
  const last = history[history.length - 1] || {};
  const version = bumpPatch(last.version || "0.0.0");
  const entry = {
    version,
    description,
  };

  history.push(entry);
  fs.writeFileSync(filePath, JSON.stringify(history, null, 2) + "\n");
};

main();
