import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
  } from 'typeorm';

  @Entity({ name: 'requests_additional' })
  export class RequestsAdditionalEntity {
    @PrimaryGeneratedColumn({ name: 'id', type: 'int' })
    id!: number;

    @Column({ name: 'id_detail', type: 'varchar', length: 255})
    id_detail!: string;
  
    @Column({ name: 'name', type: 'varchar', length: 255})
    name!: string;
  
    @Column({ name: 'amount', type: 'int' })
    amount!:number;

    @Column({ name: 'code', type: 'varchar' })
    code!:string;
  
    @Column({ name: 'c1', type: 'varchar', length: 255})
    c1!: string;

    @Column({ name: 'c2', type: 'varchar', length: 255})
    c2!: string;

    @Column({ name: 'unit_cost', type: 'double'})
    unit_cost!: number;
  
    @Column({ name: 'description', type: 'varchar', length: 255  })
    description!: string;

    @Column({ name: 'observation', type: 'varchar', length: 255  })
    observation!: string;

    @Column({ name: 'folio_request', type: 'varchar', length: 255  })
    folio_request!: string;

    @Column({ name: 'category1', type: 'varchar', length: 255})
    category1!: string;

    @Column({ name: 'category', type: 'varchar', length: 255})
    category!: string;

    @Column({ name: 'subcategory', type: 'varchar', length: 255})
    subcategory!: string;

    @Column({ name: 'unit', type: 'varchar', length: 255})
    unit!: string;
  
    @Column({ name: 'status', type: 'boolean', default: true })
    status!: boolean;
  
}




