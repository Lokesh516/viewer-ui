const axios = require("axios");
const FormData = require("form-data");
const { Buffer } = require("buffer");

module.exports.handler = async function (event) {
  console.log("📩 Received event");

  let bodyData;
  try {
    console.log("📦 Parsing request body...");
    bodyData = JSON.parse(event.body);
    console.log("✅ Body parsed:", bodyData);
  } catch (err) {
    console.log("❌ JSON parsing error:", err.message);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid JSON payload." })
    };
  }

  const { target, payload, filename } = bodyData;
  console.log(`🎯 Routing target: ${target}`);

  if (!target) {
    console.log("❌ Missing target key");
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing target API identifier." })
    };
  }

  try {
    switch (target) {
      case "ask":
        console.log("➡️ Proxying to ask.php");
        return await proxyJson("https://smartview.iceiy.com/ask.php", payload);

      case "build":
        console.log("➡️ Proxying to build_pdf_context.php");
        return await proxyJson("https://smartview.iceiy.com/build_pdf_context.php", payload);

      case "upload":
        console.log("➡️ Proxying to upload.php");
        if (!payload?.file) {
          console.log("❌ No file found in payload");
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
    console.log("🔥 Internal error:", err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};

async function proxyJson(url, data) {
  try {
    console.log("🔗 proxyJson →", url);
    console.log("📤 Payload:", JSON.stringify(data));

    const response = await axios.post(url, data, {
      headers: { "Content-Type": "application/json" }
    });

    console.log("✅ Response from API:", response.data);
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
    console.log("🔗 proxyForm →", url);
    console.log("📄 Filename:", filename);
    console.log("📏 Base64 length:", base64File.length);

    const buffer = Buffer.from(base64File, "base64");
    const form = new FormData();
    form.append("pdf", buffer, filename);

    console.log("📤 Sending form...");
    const response = await axios.post(url, form, {
      headers: form.getHeaders()
    });

    console.log("✅ Upload response:", response.data);
    return {
      statusCode: 200,
      body: JSON.stringify(response.data)
    };
  } catch (err) {
    console.log("❌ Upload error:", err.message);
    return {
      statusCode: 502,
      body: JSON.stringify({ error: err.message })
    };
  }
}
