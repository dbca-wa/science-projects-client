#!/usr/bin/env node

/**
 * GeoJSON Optimization Script
 *
 * This script optimizes GeoJSON files by:
 * 1. Dissolving/merging features by a specified property (e.g., region name)
 * 2. Simplifying geometries using Turf.js
 * 3. Reducing coordinate precision
 * 4. Removing unnecessary properties
 */

import fs from "fs";
import path from "path";
import * as turf from "@turf/turf";

const COORDINATE_PRECISION = 6; // Decimal places for coordinates

/**
 * Dissolve features by grouping property
 * Combines all geometries into MultiPolygons for efficiency
 */
function dissolveByProperty(geojson, propertyName) {
	const groups = {};

	// Group features by property value
	geojson.features.forEach((feature) => {
		const key = feature.properties[propertyName];
		if (!groups[key]) {
			groups[key] = [];
		}
		groups[key].push(feature);
	});

	// Merge geometries for each group
	const dissolved = Object.entries(groups).map(([key, features]) => {
		try {
			// If only one feature, return it directly
			if (features.length === 1) {
				return features[0];
			}

			// Collect all polygon coordinates
			const allCoordinates = [];

			features.forEach((feature) => {
				const geom = feature.geometry;
				if (geom.type === "Polygon") {
					allCoordinates.push(geom.coordinates);
				} else if (geom.type === "MultiPolygon") {
					allCoordinates.push(...geom.coordinates);
				}
			});

			// Create a single MultiPolygon with all coordinates
			return {
				type: "Feature",
				properties: features[0].properties,
				geometry: {
					type: "MultiPolygon",
					coordinates: allCoordinates,
				},
			};
		} catch (error) {
			console.error(`Error dissolving ${key}:`, error.message);
			// Return first feature as fallback
			return features[0];
		}
	});

	return {
		type: "FeatureCollection",
		features: dissolved,
	};
}

/**
 * Simplify geometry coordinates
 */
function simplifyGeometry(geojson, tolerance = 0.001) {
	return {
		...geojson,
		features: geojson.features.map((feature) => {
			try {
				const simplified = turf.simplify(feature, {
					tolerance,
					highQuality: false,
				});
				return simplified;
			} catch (error) {
				console.error("Error simplifying feature:", error.message);
				return feature;
			}
		}),
	};
}

/**
 * Round coordinates to specified precision
 */
function roundCoordinates(geojson, precision = COORDINATE_PRECISION) {
	const round = (num) =>
		Math.round(num * Math.pow(10, precision)) / Math.pow(10, precision);

	const roundCoords = (coords) => {
		if (typeof coords[0] === "number") {
			return coords.map(round);
		}
		return coords.map(roundCoords);
	};

	return {
		...geojson,
		features: geojson.features.map((feature) => ({
			...feature,
			geometry: {
				...feature.geometry,
				coordinates: roundCoords(feature.geometry.coordinates),
			},
		})),
	};
}

/**
 * Keep only essential properties
 */
function filterProperties(geojson, keepProperties) {
	return {
		...geojson,
		features: geojson.features.map((feature) => ({
			...feature,
			properties: keepProperties.reduce((acc, prop) => {
				if (feature.properties[prop] !== undefined) {
					acc[prop] = feature.properties[prop];
				}
				return acc;
			}, {}),
		})),
	};
}

/**
 * Main optimization function
 */
function optimizeGeoJSON(inputPath, outputPath, options = {}) {
	console.log(`\nProcessing: ${inputPath}`);

	// Read input file
	const raw = fs.readFileSync(inputPath, "utf8");
	let geojson = JSON.parse(raw);

	const originalSize = Buffer.byteLength(raw);
	const originalFeatures = geojson.features.length;

	console.log(
		`  Original: ${originalFeatures} features, ${(originalSize / 1024 / 1024).toFixed(2)} MB`
	);

	// Dissolve by property if specified
	if (options.dissolveBy) {
		console.log(`  Dissolving by: ${options.dissolveBy}`);
		geojson = dissolveByProperty(geojson, options.dissolveBy);
		console.log(`  After dissolve: ${geojson.features.length} features`);
	}

	// Simplify geometries
	if (options.simplify !== false) {
		const tolerance = options.tolerance || 0.001;
		console.log(`  Simplifying with tolerance: ${tolerance}`);
		geojson = simplifyGeometry(geojson, tolerance);
	}

	// Round coordinates
	console.log(
		`  Rounding coordinates to ${COORDINATE_PRECISION} decimal places`
	);
	geojson = roundCoordinates(geojson);

	// Filter properties
	if (options.keepProperties) {
		console.log(`  Keeping properties: ${options.keepProperties.join(", ")}`);
		geojson = filterProperties(geojson, options.keepProperties);
	}

	// Write output
	const output = JSON.stringify(geojson);
	fs.writeFileSync(outputPath, output);

	const finalSize = Buffer.byteLength(output);
	const reduction = ((1 - finalSize / originalSize) * 100).toFixed(1);

	console.log(
		`  Final: ${geojson.features.length} features, ${(finalSize / 1024 / 1024).toFixed(2)} MB`
	);
	console.log(`  Size reduction: ${reduction}%`);

	return geojson;
}

// Configuration for each dataset
const datasets = [
	{
		name: "IBRA_DATA",
		input: "public/data/raw/IBRA_DATA.geojson",
		output: "public/data/optimized/optimized_IBRA_DATA.geojson",
		options: {
			dissolveBy: "IWA_SUB_NAME_7", // Merge all fragments of each sub-region
			tolerance: 0.0125, // Balanced simplification to stay just under 1MB after formatting
			keepProperties: [
				"IWA_SUB_NAME_7",
				"IWA_SUB_CODE_7",
				"IWA_REG_NAME_7",
				"IWA_REG_CODE_7",
				"IWA_REG_NAME_6",
				"IWA_SUB_NAME_6",
			],
		},
	},
	{
		name: "IMCRA_DATA",
		input: "public/data/raw/IMCRA_DATA.geojson",
		output: "public/data/optimized/optimized_IMCRA_DATA.geojson",
		options: {
			dissolveBy: "MESO_NAME",
			tolerance: 0.005,
			keepProperties: ["MESO_NAME", "MESO_ABBR", "WATER_TYPE"],
		},
	},
	{
		name: "DBCA_DISTRICT_DATA",
		input: "public/data/raw/DBCA_DISTRICT_DATA.geojson",
		output: "public/data/optimized/optimized_DBCA_DISTRICT_DATA.geojson",
		options: {
			tolerance: 0.001,
			keepProperties: ["DDT_DISTRICT_NAME", "DDT_OFFICE", "ADMIN_ZONE"],
		},
	},
	{
		name: "DBCA_REGION_DATA",
		input: "public/data/raw/DBCA_REGION_DATA.geojson",
		output: "public/data/optimized/optimized_DBCA_REGION_DATA.geojson",
		options: {
			tolerance: 0.001,
			keepProperties: ["DRG_REGION_NAME", "DRG_OFFICE"],
		},
	},
	{
		name: "NRM_DATA",
		input: "public/data/raw/NRM_DATA.geojson",
		output: "public/data/optimized/optimized_NRM_DATA.geojson",
		options: {
			tolerance: 0.001,
			keepProperties: ["NRG_REGION_NAME", "NRG_NRM_BODY", "NRG_STATE"],
		},
	},
];

// Process all datasets
console.log("Starting GeoJSON optimization...\n");

for (const dataset of datasets) {
	try {
		optimizeGeoJSON(dataset.input, dataset.output, dataset.options);
	} catch (error) {
		console.error(`\nError processing ${dataset.name}:`, error.message);
	}
}

console.log("\nOptimization complete!");
