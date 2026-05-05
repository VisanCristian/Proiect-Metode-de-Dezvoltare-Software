async function testUpload() {
    const formData = new FormData();
    const blob = new Blob(["hello world"], { type: "text/plain" });
    formData.append("file", blob, "test.txt");
    formData.append("folderId", "1");
    formData.append("userId", "0");

    try {
        const response = await fetch("http://localhost:8080/api/filesystem/files/add", {
            method: "POST",
            body: formData,
        });
        const text = await response.text();
        console.log("Status:", response.status);
        console.log("Body:", text);
    } catch (e) {
        console.error(e);
    }
}
testUpload();
