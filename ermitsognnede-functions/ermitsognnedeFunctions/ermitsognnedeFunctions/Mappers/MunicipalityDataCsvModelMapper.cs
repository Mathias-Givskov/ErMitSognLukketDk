using CsvHelper.Configuration;
using ermitsognnedeFunctions.Models;

namespace ermitsognnedeFunctions.Mappers
{
    class MunicipalityDataCsvModelMapper : ClassMap<MunicipalityDataCsvModel>
    {
        public MunicipalityDataCsvModelMapper()
        {
            Map(m => m.Municipality).Name("Kommune").Default(null, useOnConversionFailure: true);
            Map(m => m.MunicipalityCode).Name("Kommunekode").Default(-1, useOnConversionFailure: true);
            Map(m => m.MunicipalityPopulationCount).Name("Indbyggertal i kommunen").Default(-1, useOnConversionFailure: true);
            Map(m => m.Incidence).Index(3).Default(-1, useOnConversionFailure: true);
            Map(m => m.StatusForAutomaticClosing).Name("Status for automatisk nedlukning").Default(null, useOnConversionFailure: true);
            Map(m => m.StartOfLatestAutomaticShutdown).Name("Påbegyndelsesdato for seneste automatiske nedlukning af kommunen").Default(null, useOnConversionFailure: true);
        }
    }
}
