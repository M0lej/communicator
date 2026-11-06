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
    if (axios.isAxiosError(error)) {
      const responseData: unknown = error.response?.data;
      if (
        typeof responseData === "object" &&
        responseData !== null &&
        "error" in responseData &&
        typeof responseData.error === "string"
      ) {
        return responseData;
      }

      return {
        error: error.response
          ? "Invalid email or password."
          : "Unable to connect to the server.",
      };
    }

    return {
      error: "An unexpected error occurred while logging in.",
    };
  }
}

export async function register({ request }: { request: Request }) {
  try {
    const data = Object.fromEntries((await request.formData()).entries());

    const { email, password, confirmPassword } = data;

    console.log(data);

    if (!email || !password || !confirmPassword) {
      return;
    }

    if (password != confirmPassword) {
      return {
        error: "Passwords doesn't match.",
      };
    }

    const response = await axios({
      method: "POST",
      url: "/api/auth/register",
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

export async function comparePassword(userId: string, password: string) {
  try {
    const response = await axios({
      method: "post",
      url: `/api/auth/${encodeURIComponent(userId)}/compare`,
      data: {
        password: password,
      },
    });

    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}
