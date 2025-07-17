import { CreateCategoryDto } from "@/models/category";
import { ErrorResponse, SuccessResponse } from "@/responses/api";
import { IAuthorizationService } from "@/services/AuthorizationService";
import { ICategoryService } from "@/services/CategoryService";
import { parseBodyAsync } from "@/utils/body-parser";
import { H3Event } from "h3";

export interface ICategoryController {
  postCreate(event: H3Event): Promise<SuccessResponse>
}

export class CategoryController implements ICategoryController {
  constructor(private m_categoryService: ICategoryService, private m_authorizationService: IAuthorizationService) {}

  async postCreate(event: H3Event) {

    const canDo = this.m_authorizationService.userCanDo(event.context.claims, ["create:category"]);

    if(!canDo) {
      throw new ErrorResponse("Forbidden", null, 403, "Forbidden");
    }

    const body = await parseBodyAsync(event) as CreateCategoryDto;
    const category = await this.m_categoryService.createCategory(body);

    return new SuccessResponse("Created category!", category, 201);
  }
}
