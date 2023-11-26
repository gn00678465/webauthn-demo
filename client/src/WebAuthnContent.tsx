import { useState, useEffect } from 'react';
import { Stack, TextField, Button, Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import WebAuthnClient, {
  PublicKeyOptions,
  PublicKeyCredentialAttestationAdapter,
  PublicKeyCredentialAssertionAdapter,
  PublicKeyRequestOptions
} from './webAuthnClient';
import { fetchRegisterOptions, postRegister } from './service/register';
import {
  fetchAuthenticationOptions,
  postAuthSignature
} from './service/authentication';
import { Base64Url } from './utils';

export default function WebAuthnContext() {
  const [name, setName] = useState('');
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function getAvailable(): Promise<void> {
      try {
        const res =
          WebAuthnClient.isAvailable() &&
          (await WebAuthnClient.isLocalAuthenticator());
        setIsAvailable(res);
      } catch (err) {
        setIsAvailable(false);
      }
    }

    getAvailable();
  }, []);

  async function register() {
    try {
      const {
        data: {
          data: { challenge, rpId, rpName, excludeCredentials }
        }
      } = await fetchRegisterOptions(name);
      const publicKeyOptions = new PublicKeyOptions(
        challenge,
        {
          id: crypto.getRandomValues(new Uint8Array(32)),
          name: name,
          displayName: name
        },
        rpId,
        rpName,
        {
          userVerification: 'required',
          attestation: 'direct',
          authenticatorAttachment: 'platform',
          excludeCredentials: excludeCredentials.map(({ id, ...args }) => {
            return {
              id: Base64Url.decodeBase64Url(id),
              ...args
            } as PublicKeyCredentialDescriptor;
          })
        }
      ).publicKeyOptions;
      const credentials =
        await WebAuthnClient.createPublicKey(publicKeyOptions);
      console.log(credentials);
      if (credentials) {
        await postRegister(
          name,
          new PublicKeyCredentialAttestationAdapter(credentials).toJson()
        );
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'InvalidStateError') {
          console.error(error.name);
        }
        if (error.name === 'NotAllowedError') {
          console.error(error.name);
        }
        console.error(error);
      }
    } finally {
      setName(() => '');
    }
  }

  async function authenticating() {
    try {
      const { status, data } = await fetchAuthenticationOptions(name);
      if (status === 200) {
        const {
          data: { challenge, allowCredentials }
        } = data;
        const assertionOptions = new PublicKeyRequestOptions(challenge, {
          allowCredentials: allowCredentials.map(({ id, ...args }) => {
            return {
              id: Base64Url.decodeBase64Url(id),
              ...args
            } as PublicKeyCredentialDescriptor;
          })
        }).publicKeyRequestOptions;
        const assert = await WebAuthnClient.authenticate(assertionOptions);
        if (assert) {
          const { status, data } = await postAuthSignature(
            name,
            new PublicKeyCredentialAssertionAdapter(assert).toJson()
          );
          console.log({ status, data });
          if (status === 200 && data.status === 'Success') {
            navigate('/home');
          }
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setName(() => '');
    }
  }

  return (
    <Box width={400} sx={{ display: 'inline-block' }}>
      <TextField
        label="Name"
        variant="filled"
        size="small"
        fullWidth
        value={name}
        sx={{ mt: 3 }}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setName(event.target.value);
        }}
      />

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
            onClick={async () => {
              if (name === '') return;
              await register();
            }}
          >
            Register
          </Button>
          <Button
            variant="contained"
            fullWidth
            onClick={async () => {
              await authenticating();
            }}
          >
            Authenticate
          </Button>
        </Stack>
      ) : (
        <Typography variant="h4" color="red" sx={{ mt: 3 }}>
          瀏覽器不支援 WebAuthn
        </Typography>
      )}
    </Box>
  );
}
