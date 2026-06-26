import fs from "node:fs";
import path from "node:path";
import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  getDirection,
  type Locale,
} from "../src/i18n/config";

type JsonValue = string | number | boolean | null | JsonObject | JsonValue[];
type JsonObject = { [key: string]: JsonValue };

const DICTIONARY_DIR = path.join(process.cwd(), "src", "i18n", "dictionaries");
const PLACEHOLDER_PATTERN = /\{\{[^{}]+\}\}|\$\{[^{}]+\}|\{[^{}]+\}|%\d*\$?[sdif]/g;
const strict = process.env.I18N_STRICT === "true";

function readDictionary(locale: Locale): JsonObject {
  const filePath = path.join(DICTIONARY_DIR, `${locale}.json`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing dictionary: ${path.relative(process.cwd(), filePath)}`);
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as JsonObject;
}

function flatten(value: JsonValue, prefix = ""): Record<string, JsonValue> {
  if (Array.isArray(value)) {
    return value.reduce<Record<string, JsonValue>>(
      (result, item, index) => ({ ...result, ...flatten(item, `${prefix}[${index}]`) }),
      {},
    );
  }

  if (value && typeof value === "object") {
    return Object.entries(value).reduce<Record<string, JsonValue>>((result, [key, item]) => {
      const nextPrefix = prefix ? `${prefix}.${key}` : key;
      return { ...result, ...flatten(item, nextPrefix) };
    }, {});
  }

  return { [prefix]: value };
}

function placeholders(value: JsonValue): string[] {
  if (typeof value !== "string") return [];
  return [...(value.match(PLACEHOLDER_PATTERN) ?? [])].sort();
}

const source = readDictionary(DEFAULT_LOCALE);
const sourceFlat = flatten(source);
const sourceKeys = Object.keys(sourceFlat).sort();
const errors: string[] = [];
const warnings: string[] = [];

for (const locale of SUPPORTED_LOCALES) {
  const dictionary = readDictionary(locale);
  const flat = flatten(dictionary);
  const keys = Object.keys(flat).sort();
  const missing = sourceKeys.filter((key) => !(key in flat));
  const unexpected = keys.filter((key) => !(key in sourceFlat));
  const coverage = Math.round(((sourceKeys.length - missing.length) / sourceKeys.length) * 100);

  console.log(`${locale}: ${coverage}% key coverage (${sourceKeys.length - missing.length}/${sourceKeys.length})`);

  if (missing.length) {
    const message = `${locale}: missing keys: ${missing.join(", ")}`;
    if (strict) errors.push(message);
    else warnings.push(message);
  }

  if (unexpected.length) errors.push(`${locale}: unexpected keys: ${unexpected.join(", ")}`);

  for (const key of sourceKeys) {
    if (!(key in flat)) continue;
    const expected = placeholders(sourceFlat[key]);
    const actual = placeholders(flat[key]);
    if (JSON.stringify(expected) !== JSON.stringify(actual)) {
      errors.push(`${locale}: placeholder mismatch at ${key}`);
    }
  }

  const meta = dictionary.meta;
  if (!meta || typeof meta !== "object" || Array.isArray(meta)) {
    errors.push(`${locale}: missing meta object`);
    continue;
  }
  if (meta.locale !== locale) errors.push(`${locale}: meta.locale must equal ${locale}`);
  if (meta.direction !== getDirection(locale)) {
    errors.push(`${locale}: meta.direction must equal ${getDirection(locale)}`);
  }
}

for (const warning of warnings) console.warn(`WARNING: ${warning}`);

if (errors.length) {
  console.error("i18n validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`i18n validation passed in ${strict ? "strict" : "fallback"} mode.`);
