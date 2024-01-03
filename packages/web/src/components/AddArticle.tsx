import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
} from "@chakra-ui/react";
import SubHeading from "@/primitives/SubHeading";
import { useForm } from "react-hook-form";
import isHTTPUrl from "@/util/isHttpUrl";

export const AddArticle = () => {
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm();

  // @ts-ignore
  const onSubmit = async (values) => {
    await fetch("/api/article", {
      method: "POST",
      body: JSON.stringify({ url: values.url }),
    });
  };

  return (
    <Box w="100%">
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormControl isInvalid={!!errors.url} w="100%">
          <FormLabel htmlFor="url" mb={0}>
            Online Articles
          </FormLabel>
          <SubHeading>Enter URL to get transcript</SubHeading>
          <Input
            id="url"
            size="sm"
            borderRadius="md"
            placeholder="e.g. https://wikipedia.org/wiki/Sherlock_Holmes"
            {...register("url", {
              required: "This is required",
              minLength: { value: 3, message: "Minimum length should be 4" },
              validate: {
                validUrl: (v) => isHTTPUrl(v) || "Please input a valid URL.",
              },
            })}
          />
          {errors.url && (
            <FormErrorMessage>
              <>{errors.url.message}</>
            </FormErrorMessage>
          )}
        </FormControl>
        <Button mt={2} size="sm" isLoading={isSubmitting} type="submit">
          Add
        </Button>
      </form>
    </Box>
  );
};
