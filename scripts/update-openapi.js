import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_URL = 'http://127.0.0.1:8000/openapi.json';
const OUTPUT_PATH = path.join(__dirname, '..', 'API', 'FinancialDataApi', 'openplatform.json');

async function updateOpenAPISpec() {
  try {
    console.log('Fetching OpenAPI specification from:', API_URL);
    
    // Fetch the OpenAPI spec
    const response = await fetch(API_URL);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const spec = await response.json();
    
    // Format the JSON with 2-space indentation
    const formattedSpec = JSON.stringify(spec, null, 2);
    
    // Ensure the directory exists
    await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
    
    // Write the updated spec to the file
    await fs.writeFile(OUTPUT_PATH, formattedSpec, 'utf8');
    
    console.log(`✅ Successfully updated OpenAPI spec at: ${OUTPUT_PATH}`);
  } catch (error) {
    console.error('❌ Error updating OpenAPI spec:', error.message);
    process.exit(1);
  }
}

// Run the function
updateOpenAPISpec();
