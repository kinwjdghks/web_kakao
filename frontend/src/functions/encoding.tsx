export const blobToBase64 = (blob:File):Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
            // The result attribute contains the data as a base64 encoded string
            resolve(reader.result as string);
        };
        reader.onerror = reject;
    });
}