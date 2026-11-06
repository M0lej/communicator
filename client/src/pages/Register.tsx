import { Form, useActionData, useNavigate } from "react-router-dom";
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
  const formRef = useRef(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (response) {
      if (isUser(response)) {
        setErrorMessage(null);
        setUser(response);
        navigate("/");
      } else if (isError(response)) {
        setErrorMessage(response.error);
      }
    } else {
      if (formRef.current) {
        (formRef.current as HTMLFormElement).reset();
      }
    }
  }, [response]);

  return (
    <Form
      className="flex flex-col gap-4 w-fit h-fit mt-auto mb-auto ml-auto mr-auto "
      action="/register"
      method="post"
      ref={formRef}
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
