import axios from "axios";

axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL;
// axios.defaults.withCredentials = true; // cookies

export default axios;
