import {
  Button,
  Card,
  CardBody,
  CardFooter,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
} from "@chakra-ui/react";
import SubHeading from "@/primitives/SubHeading";
import { useForm } from "react-hook-form";
import isHTTPUrl from "@/util/isHttpUrl";
import { Plus } from "@phosphor-icons/react";

export const AddArticle = () => {
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  // @ts-ignore
  const onSubmit = async (values) => {
    await fetch("/api/article", {
      method: "POST",
      body: JSON.stringify({ url: values.url }),
    });
    reset();
  };

  return (
    <Card w="100%" variant="outline">
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardBody>
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
        </CardBody>
        <CardFooter>
          <Button
            variant="outline"
            isLoading={isSubmitting}
            type="submit"
            color="green"
            size="xs"
            gap={1}
          >
            <Plus size={16} weight="bold" />
            Add
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
