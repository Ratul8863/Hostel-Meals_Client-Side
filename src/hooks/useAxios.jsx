import axios from "axios";

const axiosInstance = axios.create({
    baseURL: `https://hostel-management-server-nine.vercel.app/`
})

const useAxios = () => {
    return axiosInstance;
};

export default useAxios;