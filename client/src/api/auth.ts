import axios from "axios";

export async function login({ request }: { request: Request }) {
  try {
    const data = Object.fromEntries((await request.formData()).entries());

    const { email, password } = data;

    if (!email || !password) {
      return;
    }

    const response = await axios({
      method: "post",
      url: "/auth/login",
      data: {
        email,
        password,
      },
    });

    return response;
  } catch (error) {
    console.error(error);
    return null;
  }
}
