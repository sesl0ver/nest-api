import {Global, Module} from '@nestjs/common';
import {AxiosService} from "./axios.service";
import {HttpModule} from '@nestjs/axios';

@Global()
@Module({
    imports: [HttpModule],
    providers: [AxiosService],
    exports: [AxiosService, HttpModule],
})
export class AxiosModule{}