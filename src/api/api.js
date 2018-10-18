const baseUrl =process.env.NODE_ENV==="development"?"/apis":"";
 
export default baseUrl;

export const baseImgUrl ='';

export const uploadAudioUrl = baseUrl+'/v1/uploadAudio.action'
