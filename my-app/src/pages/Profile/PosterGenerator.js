// PosterGenerator.js
export async function generatePoster(profile, posterType = 1) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
  
    const posterImage = new Image();
    posterImage.crossOrigin = "anonymous";
    posterImage.src = posterType === 1 ? "/posters/poster1.png" : "/posters/poster3.png";
  
    await new Promise((resolve) => {
      posterImage.onload = resolve;
    });
  
    canvas.width = posterImage.width;
    canvas.height = posterImage.height;
  
    ctx.drawImage(posterImage, 0, 0);
  
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        resolve(url);
      });
    });
  }
  