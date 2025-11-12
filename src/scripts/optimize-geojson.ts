import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const execAsync = promisify(exec);

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration - using absolute paths
const PROJECT_ROOT = path.resolve(__dirname, "../..");
const INPUT_DIR = path.join(PROJECT_ROOT, "src/scripts/data/raw");
const OUTPUT_DIR = path.join(PROJECT_ROOT, "src/scripts/data/optimized");
const SIMPLIFICATION_PERCENTAGE = "10%";
const PRECISION = "0.000001";

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function optimizeGeoJSON(inputFile: string): Promise<void> {
  const fileName = path.basename(inputFile);
  const outputFile = path.join(OUTPUT_DIR, `optimized_${fileName}`);

  console.log(`\nProcessing ${fileName}...`);
  console.log("Input file path:", inputFile);
  console.log(
    "Original size:",
    (fs.statSync(inputFile).size / 1024 / 1024).toFixed(2),
    "MB",
  );

  try {
    // Run mapshaper command with quoted paths for safety
    const command =
      `mapshaper "${inputFile}" ` +
      `-simplify dp ${SIMPLIFICATION_PERCENTAGE} ` +
      `-o precision=${PRECISION} format=geojson ` +
      `"${outputFile}"`;

    console.log("Executing command:", command);
    const { stdout, stderr } = await execAsync(command);
    if (stdout) console.log("Output:", stdout);
    if (stderr) console.error("Errors:", stderr);

    // Log results
    console.log(
      "Optimized size:",
      (fs.statSync(outputFile).size / 1024 / 1024).toFixed(2),
      "MB",
    );
    console.log("✓ Successfully optimized:", fileName);
  } catch (error) {
    console.error("✗ Error processing:", fileName, error);
  }
}

async function main() {
  console.log("Project root:", PROJECT_ROOT);
  console.log("Input directory:", INPUT_DIR);
  console.log("Output directory:", OUTPUT_DIR);

  // Create directories if they don't exist
  if (!fs.existsSync(INPUT_DIR)) {
    console.error(
      `Input directory ${INPUT_DIR} does not exist. Creating it...`,
    );
    fs.mkdirSync(INPUT_DIR, { recursive: true });
    console.log(`Please place your GeoJSON files in ${INPUT_DIR}`);
    process.exit(1);
  }

  // Check if mapshaper is installed
  try {
    await execAsync("mapshaper -v");
  } catch (error) {
    console.error("Mapshaper is not installed. Installing...");
    try {
      await execAsync("bun install -g mapshaper");
      console.log("✓ Mapshaper installed successfully");
    } catch (installError) {
      console.error("Failed to install mapshaper:", installError);
      process.exit(1);
    }
  }

  // List all files in input directory
  console.log("\nFiles in input directory:");
  fs.readdirSync(INPUT_DIR).forEach((file) => {
    console.log("- ", file);
  });

  // Get all GeoJSON files from input directory
  const files = fs
    .readdirSync(INPUT_DIR)
    .filter((file) => file.endsWith(".geojson"))
    .map((file) => path.join(INPUT_DIR, file));

  if (files.length === 0) {
    console.error(`No GeoJSON files found in ${INPUT_DIR}`);
    console.log("Please add your .geojson files to this directory");
    process.exit(1);
  }

  console.log(`\nFound ${files.length} GeoJSON files to process:`, files);

  // Process all files
  await Promise.all(files.map(optimizeGeoJSON));

  console.log("\n✓ All files processed successfully!");
  console.log(`Optimized files are located in ${OUTPUT_DIR}`);
}

main().catch(console.error);
