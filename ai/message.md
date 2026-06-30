Fixed: src/controllers/v3/mobile/citizen.controller.js:281-345. The endpoint now accepts the three file fields and re-streams them to One DB as multipart/form-data (it was silently broken before).

How the frontend uses it
Endpoint: POST /api/v3/mobile/citizens/:accountId/uploads
Content-Type: multipart/form-data (let the HTTP client set this automatically — do not set it by hand, the boundary must be generated)
Auth: Authorization: Bearer <accessToken>

File fields (all optional, send at least one):

Form field	Becomes on Server B	Use for
identification	PROFILE_ID	ID document image
document	PROFILE_DOCUMENT	profile document / picture
signature	PROFILE_SIGNATURE	signature image
You don't send brgyId/accountId in the body — the server injects them from the token + URL.

Web (browser fetch)

const fd = new FormData();
fd.append("identification", idFileInput.files[0]); // a File/Blob
fd.append("document", docFileInput.files[0]);      // optional
// fd.append("signature", sigBlob);                // optional

const res = await fetch(
  `http://192.168.2.77:1230/api/v3/mobile/citizens/${accountId}/uploads`,
  {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` }, // NO Content-Type here
    body: fd,
  }
);
const data = await res.json(); // { "message": "File uploaded successfully" }
React Native

const fd = new FormData();
fd.append("identification", {
  uri: photo.uri,                 // file:// path from image picker
  name: "id.jpg",
  type: "image/jpeg",
});

const res = await fetch(
  `${BASE_URL}/api/v3/mobile/citizens/${accountId}/uploads`,
  { method: "POST", headers: { Authorization: `Bearer ${accessToken}` }, body: fd }
);
axios

await axios.post(
  `${BASE_URL}/api/v3/mobile/citizens/${accountId}/uploads`,
  fd,
  { headers: { Authorization: `Bearer ${accessToken}` } } // axios sets multipart boundary from fd
);
Success: 200 { "message": "File uploaded successfully" }
Errors: 400 no files sent · 401 missing/invalid token · 404/500 from upstream.

Notes:

Only identification, document, signature are accepted as files — any other file field name returns a multer "Unexpected field" error.
Uploading the same field again replaces that citizen's existing file of that type (Server B upserts by type).
The flow is typically: create citizen (POST /citizens) → upload docs here → then POST /citizens/:id/approve (which checks a PROFILE_ID or profile document exists first).