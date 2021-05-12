using CsvHelper.Configuration;
using ermitsognnedeFunctions.Models;

namespace ermitsognnedeFunctions.Mappers
{
    class DistrictDataCsvModelMapper : ClassMap<DistrictDataCsvModel>
    {
        public DistrictDataCsvModelMapper()
        {
            Map(m => m.DistrictCode).Name("Sognekode").Default(-1, useOnConversionFailure: true);
            Map(m => m.District).Name("Sogn").Default(null, useOnConversionFailure: true);
            Map(m => m.Municipality).Name("Kommune1").Default(null, useOnConversionFailure: true);
            Map(m => m.DistrictPopulationCount).Name("Indbyggertal i sogn").Default(-1, useOnConversionFailure: true);
            Map(m => m.Incidence).Index(9).Default(-1, useOnConversionFailure: true);
            Map(m => m.NewInfectedCount).Index(10).Default(-1, useOnConversionFailure: true);
            Map(m => m.PositivePercentage).Index(11).Default(-1, useOnConversionFailure: true);
            Map(m => m.StatusForAutomaticClosing).Name("Status for automatisk nedlukning").Default(null, useOnConversionFailure: true);
            Map(m => m.StartOfLatestAutomaticShutdown).Name("Påbegyndelsesdato for seneste automatiske nedlukning af sognet").Default(null, useOnConversionFailure: true);
        }
    }
}
