import { Form, useActionData, useNavigate, useLocation } from "react-router-dom";
import Input from "../components/Input";
import Label from "../components/Label";
import Button from "../components/Button";
import { useEffect, useRef, useState } from "react";
import { useUserContext } from "../providers/UserProvider";
import Error, { isError, isUser } from "../components/Error";

export default function Register() {
  const response = useActionData();
  const { setUser } = useUserContext();
  const navigate = useNavigate();
  const location = useLocation();
  const formRef = useRef(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setErrorMessage(null);
  }, [location.pathname]);

  useEffect(() => {
    if (response) {
      if (isUser(response)) {
        setErrorMessage(null);
        setUser(response);
        navigate("/");
      } else if (isError(response)) {
        setErrorMessage(response.message);
      }
    } else {
      if (formRef.current) {
        (formRef.current as HTMLFormElement).reset();
      }
    }
  }, [response]);

  return (
    <Form
      className="mx-auto my-auto flex h-max w-full max-w-sm flex-col items-center gap-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
      action="/register"
      method="post"
      ref={formRef}
    >
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Create your account</h1>
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
      <Label htmlFor="email" className="w-70">
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
      <Label htmlFor="email" className="w-70">
        Repeat password
        <br />
        <Input
          type="password"
          name="confirmPassword"
          id="confirmPassword"
          placeholder="****"
          required
        />
      </Label>
      {errorMessage && <Error message={errorMessage} />}
      <Button className="w-70" type="submit">
        Register
      </Button>
    </Form>
  );
}
