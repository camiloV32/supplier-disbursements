import { Controller } from "@nestjs/common";
import { AUTHENTICATION_ROUTE } from "../route.constants";

@Controller({
    path: AUTHENTICATION_ROUTE,
    version: "1"
})
export class AuthenticationController {
    constructor() {}
}