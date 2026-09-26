import { Form } from "react-router-dom";
import Input from "./components/Input";
import Label from "./components/Label";
import Button from "./components/Button";

export default function Auth() {
  return (
    <Form
      className="flex flex-col gap-4 w-full justify-center items-center bg-blue-500"
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
