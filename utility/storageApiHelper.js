

export const setStorageData = (data) => {
  console.log('Setting storage data:', data);
  localStorage.setItem('storageData', data);
};

export const getStorageData = () => {
  console.log('Getting storage data:', localStorage.getItem('storageData'));
  return localStorage.getItem('storageData');
};