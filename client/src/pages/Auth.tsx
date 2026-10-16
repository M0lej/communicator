import { Form, useActionData, useNavigate } from "react-router-dom";
import Input from "../components/Input";
import Label from "../components/Label";
import Button from "../components/Button";
import { useEffect, useRef } from "react";
import { useUserContext } from "../providers/UserProvider";

export default function Auth() {
  const response = useActionData();
  const { setUser } = useUserContext();
  const navigate = useNavigate();
  const formRef = useRef(null);

  useEffect(() => {
    if (response) {
      setUser(response);
      navigate("/");
    } else {
      if (formRef.current) {
        (formRef.current as HTMLFormElement).reset();
      }
    }
  }, [response]);

  return (
    <Form
      className="flex flex-col gap-4 w-full justify-center items-center bg-blue-500"
      action="/login"
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
        />
      </Label>
      <Button className="w-70" type="submit">
        Login
      </Button>
    </Form>
  );
}
