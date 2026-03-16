export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 8;
};

export const validatePhone = (phone) => {
  const regex = /^[0-9]{10}$/;
  return regex.test(phone.replace(/[^\d]/g, ''));
};

export const validateAge = (age) => {
  return age >= 18 && age <= 65;
};

export const validateQuantity = (qty) => {
  return qty > 0 && qty <= 10;
};
