import axios from "axios";
import { api } from "./client";

export async function login({ request }: { request: Request }) {
  try {
    const data = Object.fromEntries((await request.formData()).entries());

    const { email, password } = data;

    if (!email || !password) {
      return;
    }

    const response = await api({
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
        "message" in responseData &&
        typeof responseData.message === "string"
      ) {
        return responseData;
      }

      return {
        message: error.response
          ? "Invalid email or password."
          : "Unable to connect to the server.",
      };
    }

    return {
      message: "An unexpected error occurred while logging in.",
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
        message: "Passwords doesn't match.",
      };
    }

    const response = await api({
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

export async function logout(): Promise<void> {
  await api.post("/api/auth/logout");
}

export async function getUserData() {
  try {
    const response = await api({
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
    const response = await api({
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
