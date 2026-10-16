import axios from "axios";

export async function login({ request }: { request: Request }) {
  try {
    const data = Object.fromEntries((await request.formData()).entries());

    const { email, password } = data;

    if (!email || !password) {
      return;
    }

    const response = await axios({
      method: "POST",
      url: "/api/auth/login",
      data: {
        email,
        password,
      },
    });

    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getUserData() {
  try {
    const response = await axios({
      method: "get",
      url: "/api/auth/me",
    });

    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}
