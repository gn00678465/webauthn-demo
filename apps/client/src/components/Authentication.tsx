import { useRef, useEffect } from "react";
import type { ReactNode } from "react";
import { Stack, Button, Typography } from "@mui/material";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";

export interface AuthenticationProps {
  isAvailable: boolean;
  children?: ReactNode;
  onAuthentication?: (name: string, single?: AbortSignal) => Promise<void>;
  onPasskeys?: (single?: AbortSignal) => Promise<void>;
}

type FormValue = {
  username: string;
};

const Authentication = ({
  isAvailable,
  children,
  onAuthentication,
  onPasskeys
}: AuthenticationProps) => {
  const abortControllerRef = useRef<null | AbortController>(null);
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormValue>({ defaultValues: { username: "" } });

  useEffect(() => {
    if (!abortControllerRef.current) {
      abortControllerRef.current = new AbortController();
    }
  }, []);

  function abort() {
    abortControllerRef.current?.abort("Abort previous request");
    abortControllerRef.current = new AbortController();
  }

  const onSubmit: SubmitHandler<FormValue> = async ({ username }) => {
    abort();
    await onAuthentication?.(username, abortControllerRef.current?.signal);
  };

  return (
    <>
      {children}
      <Typography
        variant="h6"
        sx={{ fontWeight: 400, fontSize: { xs: "1rem", sm: "1.25rem" } }}
      >
        No passkey yet?{" "}
        <Link
          to="/passkeys/create"
          style={{ color: "#4DE6B4" }}
        >
          Create a passkey
        </Link>
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
        <FormControl
          error={errors.username ? true : false}
          sx={{ mt: 3, width: "100%" }}
        >
          <InputLabel htmlFor="component-outlined">Email</InputLabel>
          <OutlinedInput
            id="component-outlined"
            defaultValue=""
            label="Email"
            autoComplete="username webauthn"
            {...register("username", { required: "Email Address is required" })}
            aria-invalid={errors.username ? "true" : "false"}
          />
          {errors?.username && <FormHelperText>{errors.username.message}</FormHelperText>}
        </FormControl>
        {isAvailable ? (
          <Stack
            direction="row"
            spacing={3}
            useFlexGap
            sx={{ mt: 3 }}
            justifyContent="center"
          >
            <Button
              variant="contained"
              fullWidth
              type="submit"
            >
              Authenticate
            </Button>
            <Button
              variant="contained"
              fullWidth
              onClick={async () => {
                abort();
                await onPasskeys?.(abortControllerRef.current?.signal);
              }}
            >
              Passkeys
            </Button>
          </Stack>
        ) : (
          <Typography
            variant="h4"
            color="error"
            sx={{ mt: 3 }}
          >
            瀏覽器不支援 WebAuthn
          </Typography>
        )}
      </form>
    </>
  );
};

export default Authentication;
