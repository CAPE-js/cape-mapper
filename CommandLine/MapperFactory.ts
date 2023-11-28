import {Mapper} from "../CapeMapper/Mapper";


export class MapperFactory {
    public getMapper(config: any) {
        return Mapper.getMapper(config)
    }
}