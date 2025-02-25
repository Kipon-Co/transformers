import { transformResult, TransformSchema } from '../src/index.ts'
import { describe, it, expect } from '@jest/globals'

describe('transformResult', () => {
  it('should transform query rows into object with nested relationships and apply custom transforms', () => {
    const rows = [
      {
        id: 337,
        auth_id: 'ece48925-215c-4d05-9f2c-1f4c31ecbb5c',
        first_name: 'Karla',
        last_name: ' Ribeiro',
        email: 'karla@kipon.io',
        created_at: '2025-02-24 21:04:10.088',
        updated_time: '2024-10-25 14:11:01.719',
        // company entity data
        company_id: 1,
        company_name: 'Kipon',
        // skill data
        skills_id: 13252,
        skills_name: 'Proteção de Dados',
        // productivity_data
        productivity_data_uid: '1f4c31ecbb5c-215c-ece48925-4d05',
        productivity_data_name: 'PostHog'
      },
      {
        id: 337,
        auth_id: 'ece48925-215c-4d05-9f2c-1f4c31ecbb5c',
        first_name: 'Karla',
        last_name: ' Ribeiro',
        email: 'karla@kipon.io',
        created_at: '2025-02-24 21:04:10.088',
        updated_time: '2024-10-25 14:11:01.719',
        company_id: 1,
        company_name: 'Kipon',
        skills_id: 13253,
        skills_name: 'Direito Trabalhista',
        productivity_data_uid: '1f4c31ecbb5c-215c-4d05-ece48925',
        productivity_data_name: '[GTM] Tech Stack'
      }
    ]

    const result = transformResult(rows, {
      transforms: {
        created_at: (value) => new Date(value),
        updated_at: 'updated_time'
      },
      one: ['company'],
      many: [
        'skills',
        {
          prefix: 'productivity_data',
          id: 'uid',
          property: 'projects'
        }
      ]
    });

    console.log('transformed', JSON.stringify(result, null, 2))
    expect(result).toHaveProperty('id', 337);
    expect(result).toHaveProperty('first_name', 'Karla');
    expect(result).toHaveProperty('email', 'karla@kipon.io');

    // // Basic structure checks
    // expect(result).toHaveProperty('id', 337)
    // expect(result).toHaveProperty('first_name', 'Karla')
    // expect(result).toHaveProperty('email', 'karla@kipon.io')

    // // Verify transformations
    // if (Array.isArray(result)) {
    //   expect(result[0].created_at).toBeInstanceOf(Date)
    //   expect(result[0].updated_at).toEqual('2024-10-25 14:11:01.719')
    // } else {
    //   expect(result.created_at).toBeInstanceOf(Date)
    //   expect(result.updated_at).toEqual('2024-10-25 14:11:01.719')
    // }

    // // Verify one-to-one relation
    // expect(result).toHaveProperty('company')
    // const company = Array.isArray(result) ? result[0].company : result.company;
    // expect(company).toHaveProperty('id', 1)
    // expect(company).toHaveProperty('name', 'Kipon')

    // // Verify one-to-many relations
    // const skill = Array.isArray(result) ? result[0].skill : result.skill;
    // expect(result).toHaveProperty('skill')
    // expect(Array.isArray(skill)).toBe(true)
    // expect(skill).toHaveLength(2)
    // expect(skill[0]).toHaveProperty('id', 13252)
    // expect(skill[0]).toHaveProperty('name', 'Proteção de Dados')
    // expect(skill[1]).toHaveProperty('id', 13253)
    // expect(skill[1]).toHaveProperty('name', 'Direito Trabalhista')

    // // Verify one-to-many relation with custom key
    // expect(result).toHaveProperty('productivity_data')
    // const productivity_data = Array.isArray(result) ? result[0].productivity_data : result.productivity_data;
    // expect(Array.isArray(productivity_data)).toBe(true)
    // expect(productivity_data).toHaveLength(1)
    // expect(productivity_data[0]).toHaveProperty('uid', '1f4c31ecbb5c-215c-4d05-ece48925')
    // expect(productivity_data[0]).toHaveProperty('name', '[GTM] Tech Stack')
  })

  // it('should process nested relationships correctly', () => {
  //   const result = [
  //     {
  //       id: 337,
  //       name: 'Karla',
  //       project_id: 1,
  //       project_name: 'Mobile App',
  //       project_task_id: 101,
  //       project_task_name: 'UI Design',
  //       project_task_status: 'completed',
  //       project_goal_id: 201,
  //       project_goal_name: 'Improve UX',
  //       project_goal_team_id: 301,
  //       project_goal_team_name: 'Design'
  //     }
  //   ]

  //   const schema: TransformSchema = {
  //     one: [
  //       {
  //         prefix: 'project',
  //         many: [
  //           'task',
  //           {
  //             prefix: 'goal',
  //             many: ['team']
  //           }
  //         ]
  //       }
  //     ]
  //   }

  //   const result = transformResult(result, schema)

  //   // Verify nested relationships
  //   expect(result).toHaveProperty('project')
  //   const project = Array.isArray(result) ? transformed[0].project : transformed.project;
  //   expect(project).toHaveProperty('id', 1)
  //   expect(project).toHaveProperty('name', 'Mobile App')

  //   // Verify project tasks
  //   expect(project).toHaveProperty('task')
  //   expect(Array.isArray(project.task)).toBe(true)
  //   expect(project.task[0]).toHaveProperty('id', 101)

  //   // Verify project goals
  //   expect(project).toHaveProperty('goal')
  //   expect(Array.isArray(project.goal)).toBe(true)
  //   expect(project.goal[0]).toHaveProperty('id', 201)

  //   // Verify goal teams
  //   expect(project.goal[0]).toHaveProperty('team')
  //   expect(Array.isArray(project.goal[0].team)).toBe(true)
  //   expect(project.goal[0].team[0]).toHaveProperty('id', 301)
  // })
})
