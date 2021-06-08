import React, { useState, useEffect } from "react"
import PropTypes from "prop-types"
import styled from "styled-components"
import Filter from "./filter"
import media from "../styles/utils/media-queries"
import Button from "../styles/button/button"
import { themeVal } from "../styles/utils/general"

const FilterSection = styled.section`
  display: flex;
  justify-content: start;
  align-items: stretch;
  flex-flow: column nowrap;
  ${media.mediumUp`
    flex-flow: row wrap;
    align-items: baseline;
  `}
  [data-reach-listbox-input] {
    margin-bottom: 1rem;
    ${media.mediumUp`
        margin-right: 1rem;
      `}
  }
`

const FilterHeading = styled.h5`
  flex-basis: 100%;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  opacity: 0.8;
  font-size: 0.875rem;
  font-weight: bold;
`

const FilterChips = styled.section`
  flex-basis: 100%;
  display: flex;
  flex-flow: column nowrap;
  ${media.mediumUp`
    flex-flow: row wrap;
  `}
`

const FilterChip = styled.aside`
  display: flex;
  flex-basis: 100%;
  align-items: baseline;
  flex-flow: row wrap;
`

const ChipHeading = styled.p`
  display: inline-block;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 0.875rem;
  color: ${themeVal("color.baseMed")};
  margin: 0;
  margin-right: 1rem;
`

const ChipButton = styled(Button)`
  & ~ & {
    margin-left: 0.5rem;
  }
  span:after {
    content: '\\2715';
    font-size: 0.875rem;
    margin-left: 0.5rem;
    opacity: 0.4;
  }
`

/*
  Creates a new set of methods for the guide.
*/
const createGuides = (methodIds, fullGuide, activitiesInCustomGuide) => {
  const newGuide = {}
  // creates guide with active methods
  methodIds.forEach(id => (newGuide[id] = fullGuide[id]))
  // updates guide with activities that are currently checked
  activitiesInCustomGuide.forEach(method => {
    if(newGuide[method.id]) {
      newGuide[method.id].activities = method.activities
    } else {
      newGuide[method.id] = method
      newGuide[method.id].filterDoesNotApply = true
    }

  })
  return newGuide
}

/*
  Takes all filters, computes filteres from state to method ids.
*/
const findMethodIds = (filters, guide) => {
  // Takes array of tests for each respective property
  const findProperty = propertyTests =>
    Object.values(guide)
      .filter(({ activities }) => {
        return propertyTests.some(propertyTest => propertyTest(activities))
      })
      .map(({ id }) => id)

  return Array.from(
    new Set([
      ...filters.methods,
      // Activities
      ...findProperty([
        activities =>
          filters.activities.some(
            selectedActivities => activities[selectedActivities]
          ),
        // OrgSize
        activities => {
          const maxNumber = Math.max(...filters.orgSize)
          return Object.values(activities).some(
            ({ orgSize }) => orgSize <= maxNumber
          )
        },
        // Approaches
        activities => {
          return Object.values(activities).some(({ approaches }) =>
            approaches.some(approach => filters.approaches.includes(approach))
          )
        },
        // Remote Options
        activities => {
          return Object.values(activities).some(({ remoteOptions }) =>
            remoteOptions.some(option => filters.remoteOptions.includes(option))
          )
        },
      ]),
    ])
  )
}

const initialFilterState = {
  methods: [],
  activities: [],
  orgSize: [],
  approaches: [],
  remoteOptions: [],
}

function Filters({ fullGuide, activitiesInCustomGuide, setGuide, activities }) {
  const [selectedFilters, setFilter] = useState(initialFilterState)
  const [allActivities, setAllActivities] = useState([])

  // used because activities get reset to undefined at some point - will investigate later
  useEffect(() => {
    activities &&
      setAllActivities(
        activities.map(activity => ({
          id: activity.id,
        }))
      )
  }, [activities])

  useEffect(() => {
    if (!Object.values(selectedFilters).flat().length) {
      setGuide(fullGuide)
    } else {
      setGuide(
        createGuides(findMethodIds(selectedFilters, fullGuide), fullGuide, activitiesInCustomGuide)
      )
    }
  }, [selectedFilters])

  return (
    <FilterSection>
      <FilterHeading>Filters</FilterHeading>
      <Filter
        title="Methods"
        type="methods"
        options={Object.keys(fullGuide).map(method => ({ id: method }))}
        selected={selectedFilters}
        setFilter={setFilter}
      />
      <Filter
        title="Activities"
        type="activities"
        options={allActivities}
        selected={selectedFilters}
        setFilter={setFilter}
      />
      <Filter
        title="Org Size"
        type="orgSize"
        options={[
          { id: 25, label: "<= 25 people" },
          { id: 50, label: "<= 50" },
          { id: 100, label: "<= 100" },
          { id: 200, label: "<= 200" },
          { id: 1000, label: "<= 1000" },
        ]}
        selected={selectedFilters}
        setFilter={setFilter}
      />
      <Filter
        title="Approaches"
        type="approaches"
        options={[
          { id: "Technical" },
          { id: "Interpersonal" },
          { id: "Research" },
        ]}
        selected={selectedFilters}
        setFilter={setFilter}
      />
      <Filter
        title="Remote Options"
        type="remoteOptions"
        options={[
          { id: "Yes", label: "Yes" },
          { id: "Complete", label: "Complete" },
          { id: "Partial", label: "Partial" },
          { id: "with-support", label: "With Support" },
          { id: "None", label: "No Options" },
        ]}
        selected={selectedFilters}
        setFilter={setFilter}
      />

      {Object.values(selectedFilters).flat().length ? (
        <Button
          type="submit"
          size="xlarge"
          variation="danger-plain"
          title="Clear all filters"
          onClick={() => setFilter(initialFilterState)}
        >
          Clear Filters
        </Button>
      ) : null}
      <FilterChips>
        {Object.entries(selectedFilters).map(filter => {
          const [filterKey, filterValues] = filter
          if (filterValues.length) {
            return (
              <FilterChip>
                <ChipHeading>{filterKey}</ChipHeading>
                {
                  filterValues.map(value => {
                    return ( 
                      <ChipButton
                        variation="primary-plain"
                        key={value}
                        onClick={() => setFilter({...selectedFilters, [filterKey]: filterValues.filter(f => f !== value)})}
                      >
                        {filterKey === "orgSize" ? `<= ${value}` : value}
                      </ChipButton> 
                    )
                  })
                }
              </FilterChip>
            )
          }
        })}
      </FilterChips>
    </FilterSection>
  )
}

Filters.propTypes = {
  fullGuide: PropTypes.object,
  activitiesInCustomGuide: PropTypes.array,
  setGuide: PropTypes.func,
  activities: PropTypes.object,
}

export default Filters