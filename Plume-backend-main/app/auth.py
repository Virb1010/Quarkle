# Standard library
import os
import json
from functools import wraps

# Third Party
from flask import request, jsonify, _request_ctx_stack
from jose import jwt
from six.moves.urllib.request import urlopen

AUTH0_DOMAIN = os.getenv("AUTH0_DOMAIN")
AUTH0_AUDIENCE = os.getenv("AUTH0_AUDIENCE")
ALGORITHM = 'RS256'


def get_token_auth_header():
    """
    Obtains the authentication token from the authorization header.

    Returns:
    --------
    token : str
        authentication token
    """

    auth = request.headers.get("Authorization", None)
    if not auth:
        return None  # Authorization header is missing

    parts = auth.split()

    if parts[0].lower() != "bearer":
        return None  # Authorization header must start with Bearer
    elif len(parts) == 1:
        return None  # Token not found
    elif len(parts) > 2:
        return None  # Authorization header must be Bearer token

    token = parts[1]
    return token


def validate_auth_token(token):
    """
    Validates a JWT authentication token and returns the user's payload if it's valid,
    and `None` if it's not.

    Parameters:
    -----------
    token : str

    Returns:
    --------
    payload : Union[Dict[str, str], None]
        dictionary representing the authenticated user's state,
        or `None` if the token is invalid
    """

    if token:
        jsonurl = urlopen(f"https://{AUTH0_DOMAIN}/.well-known/jwks.json")
        jwks = json.loads(jsonurl.read())
        try:
            unverified_header = jwt.get_unverified_header(token)
        except jwt.JWTError:  # Invalid header (use a RS256 signed Access Token)
            # print("Invalid header")
            return None

        rsa_key = {}
        for key in jwks["keys"]:
            if key["kid"] == unverified_header["kid"]:
                rsa_key = {
                    "kty": key["kty"],
                    "kid": key["kid"],
                    "use": key["use"],
                    "n": key["n"],
                    "e": key["e"],
                }

        if rsa_key:
            try:
                payload = jwt.decode(
                    token,
                    rsa_key,
                    algorithms=["RS256"],
                    audience=AUTH0_AUDIENCE,
                    issuer=f"https://{AUTH0_DOMAIN}/",
                )
            except jwt.ExpiredSignatureError:
                # print("Expired signature")
                return None  # Token is expired
            except jwt.JWTClaimsError:
                # print("Incorrect claims check the audience and issuer")
                return None  # Incorrect claims
            except Exception:
                # print("Unable to parse authentication token")
                return None  # Unable to parse authentication token

            return payload
    # print("Unable to find appropriate key")
    return None  # Unable to find appropriate key

def requires_auth(f):
    """Determines if the Access Token is valid
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        token = get_token_auth_header()
        jsonurl = urlopen("https://"+AUTH0_DOMAIN+"/.well-known/jwks.json")
        jwks = json.loads(jsonurl.read())
        unverified_header = jwt.get_unverified_header(token)
        rsa_key = {}
        for key in jwks["keys"]:
            if key["kid"] == unverified_header["kid"]:
                rsa_key = {
                    "kty": key["kty"],
                    "kid": key["kid"],
                    "use": key["use"],
                    "n": key["n"],
                    "e": key["e"]
                }
        if rsa_key:
            try:
                payload = jwt.decode(
                    token,
                    rsa_key,
                    algorithms=[ALGORITHM],
                    audience=AUTH0_AUDIENCE,
                    issuer="https://"+AUTH0_DOMAIN+"/"
                )
            except jwt.ExpiredSignatureError:
                return
                # print("token is expired")
            except jwt.JWTClaimsError:
                return
                # print("please check the audience and issuer")
            except Exception:
                return
                # print("Unable to parse authentication")
            _request_ctx_stack.top.current_user = payload
            return f(*args, **kwargs)
        # print("Unable to find appropriate key")
    return decorated
