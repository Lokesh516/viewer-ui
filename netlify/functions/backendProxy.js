import axios from 'axios';
import FormData from "form-data";
import { Buffer } from 'buffer';


export  const handler = async function(event) {
  try {
    const { target, payload, filename } = JSON.parse(event.body);

    if (!target) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing target API identifier." })
      };
    }

   
    switch (target) {
      case "ask":
        return await proxyJson("https://smartview.iceiy.com/ask.php", payload);

      case "build":
        return await proxyJson("https://smartview.iceiy.com/build_pdf_context.php", payload);

      case "upload":
        return await proxyForm("https://smartview.iceiy.com/upload.php", payload.file, filename || "upload.pdf");

      default:
        return {
          statusCode: 404,
          body: JSON.stringify({ error: `Unknown target: ${target}` })
        };
    }
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};


async function proxyJson(url, data) {
  const response = await axios.post(url, data, {
    headers: { "Content-Type": "application/json" }
  });
  return {
    statusCode: 200,
    body: JSON.stringify(response.data)
  };
}

// ⬇️ Helper for file upload
async function proxyForm(url, base64File, filename) {
  try {
    const buffer = Buffer.from(base64File, "base64");
    const form = new FormData();
    form.append("pdf", buffer, filename);

    const response = await axios.post(url, form, {
      headers: form.getHeaders()
    });

    return {
      statusCode: 200,
      body: JSON.stringify(response.data)
    };
  } catch (err) {
    console.log("Upload failed:", err.message);
    return {
      statusCode: 502,
      body: JSON.stringify({ error: err.message })
    };
  }
}
