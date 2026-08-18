import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
  } from 'typeorm';

  @Entity({ name: 'request_headers' })
  export class RequestHeadersEntity {
    @PrimaryGeneratedColumn({ name: 'id', type: 'int' })
    id!: number;

    @Column({ name: 'id_header', type: 'varchar', length: 255})
    id_header!: string;
  
    @Column({ name: 'auth1', type: 'varchar', length: 100})
    auth1!: string;
  
    @Column({ name: 'auth2', type: 'varchar', length: 100})
    auth2!: string;

    @Column({ name: 'auth3', type: 'varchar', length: 100 })
    auth3!:string;
  
    @Column({ name: 'status_header', type: 'varchar', length: 255})
    status_header!: string;

    @Column({ name: 'locationType', type: 'varchar', length: 255})
    locationType!: string;

    @Column({ name: 'date', type: 'date' })
    date!:Date;

    @Column({ name: 'hour', type: 'time' })
    hour!: string;
  
    @Column({ name: 'revision_date1', type: 'varchar', length: 55 })
    revision_date1!: string ;

    @Column({ name: 'revision_date2', type: 'varchar',length: 55 })
    revision_date2!: string;

    @Column({ name: 'revision_date3', type: 'varchar', length: 55})
    revision_date3!: string ;

    @Column({ name: 'folio_request', type: 'varchar', length: 255})
    folio_request!: string;

    @Column({ name: 'locality', type: 'varchar', length: 255})
    locality!: string;

    @Column({ name: 'notes', type: 'varchar', length: 255})
    notes!: string;

    @Column({ name: 'project', type: 'varchar', length: 255})
    project!: string;

    @Column({ name: 'official', type: 'varchar', length: 255})
    official!: string; 

    @Column({ name: 'revision1', type: 'varchar', length: 255})
    revision1!: string;

    @Column({ name: 'revision2', type: 'varchar', length: 255})
    revision2!: string;
  
    @Column({ name: 'revision3', type: 'varchar', length: 255})
    revision3!: string;

    @Column({ name: 'requester', type: 'varchar', length: 255})
    requester!: string;

    @Column({ name: 'work', type: 'varchar', length: 255})
    work!: string;
  
    @Column({ name: 'status', type: 'boolean', default: true })
    status!: boolean;
  
}