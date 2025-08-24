import axios from 'axios';

const API_URL = 'http://localhost:5000/api/vehicles';

// Get all vehicles
export const getAllVehicles = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    throw error;
  }
};

// Add a new vehicle
export const addVehicle = async (vehicleData) => {
  try {
    const response = await axios.post(API_URL, vehicleData);
    return response.data.data;
  } catch (error) {
    console.error('Error adding vehicle:', error);
    throw error;
  }
};

// Update a vehicle
export const updateVehicle = async (licenseNumber, vehicleData) => {
  try {
    const response = await axios.put(`${API_URL}/${licenseNumber}`, vehicleData);
    return response.data.data;
  } catch (error) {
    console.error('Error updating vehicle:', error);
    throw error;
  }
};

// Delete a vehicle
export const deleteVehicle = async (licenseNumber) => {
  try {
    const response = await axios.delete(`${API_URL}/${licenseNumber}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    throw error;
  }
};

export default {
  getAllVehicles,
  addVehicle,
  updateVehicle,
  deleteVehicle
};