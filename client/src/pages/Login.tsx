import { Form, Link, useActionData, useNavigate } from "react-router-dom";
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isUser(response)) {
      setErrorMessage(null);
      setUser(response);
      navigate("/");
    } else if (isError(response)) {
      setErrorMessage(response.error);
    }
  }, [response]);

  return (
    <Form
      className="flex flex-col gap-4 w-fit h-fit mt-auto mb-auto ml-auto mr-auto"
      action="/login"
      method="post"
    >
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
