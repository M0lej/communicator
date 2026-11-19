import {
  Form,
  Link,
  useActionData,
  useNavigate,
  useLocation,
} from "react-router-dom";
import Input from "../components/Input";
import Label from "../components/Label";
import Button from "../components/Button";
import { useEffect, useState } from "react";
import { useUserContext } from "../providers/UserProvider";
import Error, { isError, isUser } from "../components/Error";

export default function Login() {
  const response = useActionData();
  const { setUser } = useUserContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setErrorMessage(null);
  }, [location.pathname]);

  useEffect(() => {
    if (isUser(response)) {
      setErrorMessage(null);
      setUser(response);
      navigate("/");
    } else if (isError(response)) {
      setErrorMessage(response.error);
    } else if (response !== null && response !== undefined) {
      setErrorMessage("Unexpected server response. Please try again.");
    }
  }, [response]);

  return (
    <Form
      className="mx-auto my-auto flex h-max w-full max-w-sm flex-col items-center gap-5 rounded-2xl border border-blue-100 bg-white p-6 shadow-xl sm:p-8"
      action="/login"
      method="post"
    >
      <h1 className="text-2xl font-bold tracking-tight text-blue-950">Welcome back</h1>
      <Label htmlFor="email" className="w-70">
        Email
        <br />
        <Input
          type="email"
          name="email"
          id="email"
          placeholder="example@domain.com"
          required
        />
      </Label>
      <Label htmlFor="password" className="w-70">
        Password
        <br />
        <Input
          type="password"
          name="password"
          id="password"
          placeholder="****"
          required
        />
      </Label>
      <Link
        to="/register"
        className="mr-0 ml-auto text-sm underline text-blue-700"
      >
        Don't have an account?
      </Link>
      {errorMessage && <Error message={errorMessage} />}
      <Button className="w-70" type="submit">
        Login
      </Button>
    </Form>
  );
}
