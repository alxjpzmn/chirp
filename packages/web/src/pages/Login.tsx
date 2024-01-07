import SubHeading from "@/primitives/SubHeading";
import {
  Box,
  Button,
  Card,
  CardBody,
  CardFooter,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { useLocation } from "wouter";

export const Login = () => {
  const [_location, setLocation] = useLocation();

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
    setError,
  } = useForm();

  // @ts-ignore
  const onSubmit = async (values) => {
    const res = await fetch("/api/auth", {
      method: "POST",
      body: JSON.stringify({ password: values.password }),
    });
    if (res.status === 401) {
      setError("password", { type: "custom", message: "Incorrect password" });
    }
    if (res.status === 200) {
      setLocation("/dashboard");
    }
  };

  return (
    <Box
      w="100%"
      minH="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      <Card variant="outline">
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardBody>
            <FormControl w="100%" isInvalid={!!errors.password}>
              <FormLabel htmlFor="password" mb={0}>
                Server password
              </FormLabel>
              <SubHeading>
                Enter the password you've set as env variable
              </SubHeading>
              <Input
                id="password"
                size="sm"
                type="password"
                borderRadius="md"
                autoFocus
                autoComplete="current-password"
                {...register("password", {
                  required: "Please provide a password",
                })}
              />
              <FormErrorMessage>
                <>{errors.password?.message}</>
              </FormErrorMessage>
            </FormControl>
          </CardBody>
          <CardFooter>
            <Button
              isLoading={isSubmitting}
              type="submit"
              color="green"
              gap={1}
            >
              Submit
            </Button>
          </CardFooter>
        </form>
      </Card>
    </Box>
  );
};
