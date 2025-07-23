import axios from 'axios';
import React, { useEffect } from 'react';

import { useNavigate } from 'react-router';
import useAuth from './useAuth';

const axiosSecure = axios.create({
    baseURL: `http://localhost:8000/`
});

const useAxiosSecure = () => {
    const { user, logOut } = useAuth();
    const navigate = useNavigate();
useEffect (()=>{
    if (!user) {
        return
    }
axiosSecure.interceptors.request.use(config => {
        config.headers.Authorization = `Bearer ${user.accessToken}`
        return config;
    }, error => {
        return Promise.reject(error);
    })

},[user])
    
    axiosSecure.interceptors.response.use(res => {
        return res;
    }, error => {
        const status = error.status;
        if (status === 403) {
            navigate('/forbidden');
        }
        else if (status === 401) {
            logOut()
                .then(() => {
                    navigate('/login')
                })
                .catch(() => { })
        }

        return Promise.reject(error);
    })


    return axiosSecure;
};

export default useAxiosSecure;