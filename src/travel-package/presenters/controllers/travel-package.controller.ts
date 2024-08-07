import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { TravelPackageService } from '../../application/travel-package.service';
import { CreateTravelPackageDto } from '../dtos/create-travel-package.dto';

@Controller('travel-packages')
export class TravelPackageController {
  constructor(private readonly travelPackageService: TravelPackageService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(@Body() createTravelPackageDto: CreateTravelPackageDto) {
    await this.travelPackageService.create(createTravelPackageDto);
  }
}
