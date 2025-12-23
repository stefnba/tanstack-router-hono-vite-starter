/**
 * Compute the checksum of a file.
 * @param file - The file to compute the checksum of.
 * @returns The checksum of the file.
 */
export async function computeChecksum(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

// export async function uploadFileToS3(
//     signedUrl: string,
//     file: File,
//     onProgress?: (progress: number) => void
// ) {
//     return new Promise<void>((resolve, reject) => {
//         const xhr = new XMLHttpRequest();

//         xhr.upload.onprogress = (event) => {
//             if (event.lengthComputable && onProgress) {
//                 const percentComplete = (event.loaded / event.total) * 100;
//                 onProgress(percentComplete);
//             }
//         };

//         xhr.onload = () => {
//             if (xhr.status >= 200 && xhr.status < 300) {
//                 resolve();
//             } else {
//                 reject(new Error(`Upload failed with status ${xhr.status}`));
//             }
//         };

//         xhr.onerror = () => reject(new Error('Network error during upload'));

//         xhr.open('PUT', signedUrl);
//         xhr.setRequestHeader('Content-Type', file.type);
//         xhr.send(file);
//     });
// }
