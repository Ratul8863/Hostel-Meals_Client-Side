import axios from "axios";

const axiosInstance = axios.create({
    baseURL: `http://localhost:8000/`
})

const useAxios = () => {
    return axiosInstance;
};

export default useAxios;

// https://hostel-management-server-nine.vercel.app/