// import { useState, useEffect } from "react";
// import { isPlatform } from "@ionic/react";

import { Plugins } from "@capacitor/core";

const { Camera, CameraResultType, CameraSource, Filesystem, Directory } =
  Plugins;
// import { Storage } from "@capacitor/storage";
// import { Capacitor } from "@capacitor/core";

export function usePhotoGallery() {
  const takePhoto = async () => {
    return await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100,
    });
  };

  const uploadPhoto = async () => {
    console.log("In upload");
    return await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.PHOTOLIBRARY,
      quality: 100,
    });
  };

  const savePicture = (base64Data: string, photoName: string) => {
    const fileName = photoName + "-" + new Date().getTime() + ".jpeg";
    console.log(fileName);

    Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Documents,
    }).then((res) => console.log(res));
  };

  return {
    takePhoto,
    savePicture,
    uploadPhoto,
  };
}
