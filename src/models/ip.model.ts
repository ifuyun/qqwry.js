import { Column, CreatedAt, DataType, Model, PrimaryKey, Table } from 'sequelize-typescript';

@Table({
  tableName: 'ips',
  updatedAt: false,
  deletedAt: false
})
export class IpModel extends Model {
  @PrimaryKey
  @Column({
    field: 'ip_id',
    type: DataType.CHAR(16),
    allowNull: false
  })
  ipId: string;

  @Column({
    field: 'ip_start',
    type: DataType.BIGINT({ length: 20 }).UNSIGNED,
    allowNull: false
  })
  ipStart: number;

  @Column({
    field: 'ip_end',
    type: DataType.BIGINT({ length: 20 }).UNSIGNED,
    allowNull: false
  })
  ipEnd: number;

  @Column({
    field: 'ip_country',
    type: DataType.STRING(100),
    allowNull: false,
    defaultValue: ''
  })
  ipCountry: string;

  @Column({
    field: 'ip_province',
    type: DataType.STRING(100),
    allowNull: true,
    defaultValue: null
  })
  ipProvince: string;

  @Column({
    field: 'ip_city',
    type: DataType.STRING(100),
    allowNull: true,
    defaultValue: null
  })
  ipCity: string;

  @Column({
    field: 'ip_district',
    type: DataType.STRING(100),
    allowNull: true,
    defaultValue: null
  })
  ipDistrict: string;

  @Column({
    field: 'ip_isp',
    type: DataType.STRING(255),
    allowNull: true,
    defaultValue: null
  })
  ipIsp: string;

  @Column({
    field: 'ip_version',
    type: DataType.TINYINT().UNSIGNED,
    allowNull: false,
    defaultValue: 4
  })
  ipVersion: 4 | 6;

  @CreatedAt
  @Column({
    field: 'ip_created',
    type: DataType.BIGINT({ length: 20 }).UNSIGNED,
    allowNull: false,
    defaultValue: () => Date.now()
  })
  ipCreated: number;
}
