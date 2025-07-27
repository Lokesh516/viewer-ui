const axios = require("axios");
const FormData = require("form-data");
const { Buffer } = require("buffer");

module.exports.handler = async function (event) {
  console.log("📩 Step 1: Received event");

  let bodyData;
  try {
    console.log("📦 Step 2: Parsing request body...");
    bodyData = JSON.parse(event.body);
    console.log("✅ Parsed body:", bodyData);
  } catch (err) {
    console.log("❌ JSON parsing error:", err.message);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid JSON payload." })
    };
  }

  const { target, payload, filename } = bodyData;
  console.log(`🎯 Step 3: Target = ${target}`);

  if (!target) {
    console.log("❌ Missing target identifier.");
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing target API identifier." })
    };
  }

  try {
    switch (target) {
      case "ask":
        console.log("🚀 Step 4: Routing to proxyJson - ask");
        return await proxyJson("https://smartview.iceiy.com/ask.php", payload);

      case "build":
        console.log("🚀 Step 4: Routing to proxyJson - build");
        return await proxyJson("https://smartview.iceiy.com/build_pdf_context.php", payload);

      case "upload":
        console.log("🚀 Step 4: Routing to proxyForm - upload");
        if (!payload?.file) {
          console.log("❌ File missing in payload.");
          return {
            statusCode: 400,
            body: JSON.stringify({ error: "Missing file in payload." })
          };
        }
        return await proxyForm("https://smartview.iceiy.com/upload.php", payload.file, filename || "upload.pdf");

      default:
        console.log("❌ Unknown target:", target);
        return {
          statusCode: 404,
          body: JSON.stringify({ error: `Unknown target: ${target}` })
        };
    }
  } catch (err) {
    console.log("🔥 Runtime error:", err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};

async function proxyJson(url, data) {
  try {
    console.log(`🔗 proxyJson: Posting to ${url}`);
    console.log("📤 Payload:", data);

    const response = await axios.post(url, data, {
      headers: { "Content-Type": "application/json" }
    });

    console.log("✅ Response received:", response.data);
    return {
      statusCode: 200,
      body: JSON.stringify(response.data)
    };
  } catch (err) {
    console.log("❌ proxyJson error:", err.message);
    return {
      statusCode: 502,
      body: JSON.stringify({ error: err.message })
    };
  }
}

async function proxyForm(url, base64File, filename) {
  try {
    console.log(`🔗 proxyForm: Uploading to ${url}`);
    console.log("📄 Filename:", filename);
    console.log("📏 File length:", base64File.length);

    const buffer = Buffer.from(base64File, "base64");
    const form = new FormData();
    form.append("pdf", buffer, filename);

    console.log("📤 Sending form data...");
    const response = await axios.post(url, form, {
      headers: form.getHeaders()
    });

    console.log("✅ Upload successful:", response.data);
    return {
      statusCode: 200,
      body: JSON.stringify(response.data)
    };
  } catch (err) {
    console.log("❌ Upload failed:", err.message);
    return {
      statusCode: 502,
      body: JSON.stringify({ error: err.message })
    };
  }
}
